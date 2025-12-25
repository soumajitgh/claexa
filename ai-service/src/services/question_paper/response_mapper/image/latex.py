"""
LaTeX rendering strategy for mathematical expressions and documents.

This module uses pdflatex and ImageMagick to render LaTeX content to PNG images.
"""

import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy
from src.services.question_paper.response_mapper.image.rendering_interface import (
    ImageRenderStrategy,
    ImageRendererFactory
)

logger = logging.getLogger(__name__)


@ImageRendererFactory.register_strategy(AIQuestionImageRenderStrategy.LATEX_RENDERED)
class LaTeXRenderer(ImageRenderStrategy):
    """Renderer for LaTeX mathematical expressions and documents."""
    
    def __init__(self, dpi: int = 300, quality: int = 90):
        """
        Initialize LaTeX renderer.
        
        Args:
            dpi: Resolution in dots per inch for output image (default: 300)
            quality: Image quality 0-100 for PNG output (default: 90)
        """
        self.dpi = dpi
        self.quality = quality
    
    @property
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        return AIQuestionImageRenderStrategy.LATEX_RENDERED
    
    async def render(self, output: str) -> bytes:
        """
        Render LaTeX content to PNG image.
        
        This method uses pdflatex to compile the LaTeX and ImageMagick
        to convert the resulting PDF to a PNG image.
        
        Args:
            output: Complete LaTeX document to render (must include \\documentclass
                   and all required packages in the preamble).
                   
        Returns:
            PNG image as bytes
            
        Raises:
            RuntimeError: If LaTeX compilation or image conversion fails
        """
        try:
            logger.debug(f"Rendering LaTeX content (length: {len(output)} chars)")
            
            # Convert LaTeX to image bytes
            image_bytes = self._latex_to_image(output)
            
            logger.info(f"Successfully rendered LaTeX to image ({len(image_bytes)} bytes)")
            return image_bytes
            
        except Exception as e:
            logger.error(f"LaTeX rendering failed: {type(e).__name__}: {e}")
            raise RuntimeError(f"LaTeX rendering failed: {e}")
    
    def _latex_to_image(self, latex_expression: str) -> bytes:
        """
        Convert complete LaTeX document to image bytes.

        Pipeline:
        1. Creates a temporary LaTeX file
        2. Compiles with pdflatex to generate a tightly-cropped PDF (standalone class)
        3. Converts the first PDF page to PNG using ImageMagick (trimmed, DPI, quality)
        4. Returns PNG image as bytes
        
        Args:
            latex_expression: Complete LaTeX document to render (must include \\documentclass)
            
        Returns:
            PNG image as bytes
            
        Raises:
            RuntimeError: If LaTeX compilation or image conversion fails
        """
        temp_dir = None
        try:
            # Create temporary directory for LaTeX processing
            temp_dir = tempfile.mkdtemp()
            temp_path = Path(temp_dir)
            
            # Write LaTeX content to temporary file
            tex_file = temp_path / "document.tex"
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(latex_expression.strip())
            
            # Compile LaTeX to PDF using pdflatex
            pdf_file = temp_path / "document.pdf"
            self._compile_latex_to_pdf(tex_file, temp_dir)

            # Convert PDF to PNG using ImageMagick with tight crop
            png_file = temp_path / "document.png"
            self._convert_pdf_to_png_imagemagick(pdf_file, png_file)
            
            # Read PNG and return as bytes
            with open(png_file, 'rb') as f:
                image_bytes = f.read()
            
            logger.debug(f"Successfully rendered LaTeX to image bytes")
            return image_bytes
            
        except Exception as e:
            logger.error(f"Failed to render LaTeX: {e}")
            raise RuntimeError(f"LaTeX rendering failed: {e}")
        finally:
            # Clean up temporary directory
            if temp_dir and os.path.exists(temp_dir):
                self._cleanup_temp_directory(temp_dir)
    
    def _compile_latex_to_pdf(self, tex_file: Path, working_dir: str) -> None:
        """
        Compile LaTeX file to PDF using pdflatex.

        Args:
            tex_file: Path to the .tex file
            working_dir: Working directory for compilation

        Raises:
            RuntimeError: If pdflatex compilation fails
        """
        try:
            # Run pdflatex with non-interactive mode
            result = subprocess.run([
                'pdflatex',
                '-interaction=nonstopmode',
                '-halt-on-error',
                f'-output-directory={working_dir}',
                str(tex_file)
            ],
            capture_output=True,
            text=True,
            cwd=working_dir,
            timeout=90
            )

            if result.returncode != 0:
                logger.error(f"pdflatex failed with return code {result.returncode}")
                logger.error(f"stdout: {result.stdout}")
                logger.error(f"stderr: {result.stderr}")
                raise RuntimeError(f"pdflatex compilation failed: {result.stderr}")

            logger.debug("Successfully compiled LaTeX to PDF")

        except subprocess.TimeoutExpired:
            raise RuntimeError("pdflatex compilation timed out after 90 seconds")
        except FileNotFoundError:
            raise RuntimeError("pdflatex not found. Please install a TeX distribution (e.g., texlive)")
    
    def _convert_pdf_to_png_imagemagick(self, pdf_file: Path, png_file: Path) -> None:
        """
        Convert PDF to PNG using ImageMagick with a tight bounding box.

        Args:
            pdf_file: Path to input PDF file
            png_file: Path to output PNG file

        Raises:
            RuntimeError: If conversion fails or ImageMagick is not installed
        """
        # Map quality (0-100) to PNG compression level (0-9)
        compression_level = max(0, min(9, int(round(self.quality / 11))))

        # Use first page only: "[0]"
        input_spec = f"{pdf_file}[0]"

        # Prefer 'magick' (IM7), fall back to 'convert' (IM6)
        command = self._find_imagemagick_command()

        args = [
            command,
            '-density', str(self.dpi),
            input_spec,
            '-trim', '+repage',
            '-background', 'white', '-alpha', 'remove', '-alpha', 'off',
            '-define', f'png:compression-level={compression_level}',
            '-quality', str(self.quality),
            str(png_file)
        ]

        try:
            result = subprocess.run(
                args,
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                logger.error(f"ImageMagick failed with return code {result.returncode}")
                logger.error(f"stdout: {result.stdout}")
                logger.error(f"stderr: {result.stderr}")
                raise RuntimeError(f"PDF to PNG conversion failed: {result.stderr}")

            logger.debug("Successfully converted PDF to PNG via ImageMagick")

        except subprocess.TimeoutExpired:
            raise RuntimeError("PDF to PNG conversion timed out after 60 seconds")
        except FileNotFoundError:
            raise RuntimeError("ImageMagick not found. Please install the 'imagemagick' package")
    
    @staticmethod
    def _find_imagemagick_command() -> str:
        """Return the ImageMagick executable to use ('magick' if available else 'convert')."""
        for cmd in ('magick', 'convert'):
            try:
                subprocess.run([cmd, '-version'], capture_output=True, text=True, timeout=5)
                return cmd
            except Exception:
                continue
        # Trigger FileNotFoundError path in callers
        raise FileNotFoundError('No ImageMagick executable found (tried magick, convert)')
    
    @staticmethod
    def _cleanup_temp_directory(temp_dir: str) -> None:
        """
        Clean up temporary directory and all its contents.
        
        Args:
            temp_dir: Path to temporary directory to remove
        """
        try:
            shutil.rmtree(temp_dir)
            logger.debug(f"Cleaned up temporary directory: {temp_dir}")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary directory {temp_dir}: {e}")


def validate_latex_expression(latex_expression: str) -> bool:
    """
    Validate if a LaTeX expression is likely to render correctly.
    
    Args:
        latex_expression: LaTeX expression to validate
        
    Returns:
        True if expression appears valid, False otherwise
    """
    if not latex_expression or not latex_expression.strip():
        return False
    
    # Basic validation - check for dangerous patterns
    dangerous_patterns = ['\\write', '\\openout', '\\input', '\\include']
    if any(pattern in latex_expression for pattern in dangerous_patterns):
        return False
    
    # Check for balanced braces
    brace_count = latex_expression.count('{') - latex_expression.count('}')
    if brace_count != 0:
        return False
    
    return True
