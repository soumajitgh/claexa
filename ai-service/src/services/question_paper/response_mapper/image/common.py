"""
Common base classes and utilities for image rendering strategies.

This module provides shared functionality used by multiple rendering strategies.
Uses uv subprocess for executing Python code to generate images.
"""

import asyncio
import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from src.services.question_paper.response_mapper.image.rendering_interface import ImageRenderStrategy

logger = logging.getLogger(__name__)

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
TEMP_DIR_ROOT = PROJECT_ROOT / ".temp_renders"


class PythonSandboxRenderer(ImageRenderStrategy):
    """
    Base class for Python-based renderers using uv subprocess execution.
    
    This class provides common functionality for renderers that execute
    Python code via uv subprocess to generate images.
    """
    
    def __init__(self, dependencies: Optional[list[str]] = None, system_packages: Optional[list[str]] = None):
        """
        Initialize Python subprocess renderer.
        
        Args:
            dependencies: List of Python packages (for reference, should be installed in environment)
            system_packages: List of system packages (for reference, should be installed in system)
        """
        self.dependencies = dependencies or []
        self.system_packages = system_packages or []
        
        # Ensure temp directory exists
        TEMP_DIR_ROOT.mkdir(exist_ok=True, parents=True)
    
    async def render(self, output: str) -> bytes:
        """
        Execute Python code via uv subprocess and return image bytes.
        
        Args:
            output: Python code to execute that generates an image
            
        Returns:
            Generated image as bytes
            
        Raises:
            RuntimeError: If code execution or image generation fails
        """
        # Create a unique temporary directory in project root
        tmpdir = TEMP_DIR_ROOT / f"render_{uuid.uuid4().hex[:12]}"
        tmpdir.mkdir(parents=True, exist_ok=True)
        output_file = tmpdir / "output.png"
        
        try:
            logger.debug(f"Executing Python code via uv subprocess")
            
            # Wrap the user code to ensure it saves image to file
            wrapped_code = self._wrap_code(output, str(output_file))
            logger.debug(f"Wrapped code:\n{wrapped_code}")
            
            # Execute via uv subprocess
            result = await self._execute_via_subprocess(wrapped_code, tmpdir, output_file)
            
            if not isinstance(result, bytes):
                raise RuntimeError(f"Expected bytes from subprocess, got {type(result)}")
            
            logger.info(f"Successfully generated image using {self.strategy_type.value}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute Python code via uv subprocess: {type(e).__name__}: {e}")
            raise RuntimeError(f"Subprocess execution failed: {e}")
        finally:
            # Clean up temporary directory
            try:
                if tmpdir.exists():
                    shutil.rmtree(tmpdir)
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up temp directory {tmpdir}: {cleanup_error}")
    
    async def _execute_via_subprocess(self, code: str, tmpdir: Path, output_file: Path) -> bytes:
        """
        Execute Python code via uv subprocess.
        
        Args:
            code: Python code to execute
            tmpdir: Temporary directory for code file
            output_file: Path to output file
            
        Returns:
            Output bytes from the executed code
            
        Raises:
            RuntimeError: If subprocess execution fails
        """
        try:
            code_file = tmpdir / "code.py"
            
            # Write the code to file
            code_file.write_text(code)
            
            logger.debug(f"Running code via uv subprocess")
            logger.debug(f"Code file: {code_file}")
            logger.debug(f"Expected output: {output_file}")
            logger.debug(f"Working directory: {PROJECT_ROOT}")
            
            # Execute Python code via uv run from PROJECT_ROOT
            process = await asyncio.create_subprocess_exec(
                "uv", "run", str(code_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(PROJECT_ROOT)  # Run from project root so uv can find dependencies
            )
            
            # Wait for completion with timeout
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                raise RuntimeError("Code execution timed out after 30 seconds")
            
            # Check exit code
            if process.returncode != 0:
                stdout_msg = stdout.decode() if stdout else ""
                stderr_msg = stderr.decode() if stderr else ""
                error_msg = stderr_msg if stderr_msg else "Unknown error"
                
                logger.error(f"UV subprocess execution failed with return code {process.returncode}")
                logger.error(f"STDOUT: {stdout_msg}")
                logger.error(f"STDERR: {stderr_msg}")
                
                raise RuntimeError(f"Code execution failed (exit code {process.returncode}):\nSTDOUT: {stdout_msg}\nSTDERR: {stderr_msg}")
            
            # Read the output file
            if output_file.exists():
                image_bytes = output_file.read_bytes()
                return image_bytes
            else:
                stdout_msg = stdout.decode() if stdout else ""
                stderr_msg = stderr.decode() if stderr else ""
                raise RuntimeError(
                    f"Output file not generated. stdout: {stdout_msg}, stderr: {stderr_msg}"
                )
                
        except Exception as e:
            logger.error(f"UV subprocess execution failed: {e}")
            raise
    
    def _wrap_code(self, code: str, output_path: str) -> str:
        """
        Wrap user code to ensure proper imports and save image to file.
        
        Subclasses should override this method to provide library-specific wrapping.
        
        Args:
            code: User's Python code
            output_path: Absolute path where to save the output image
            
        Returns:
            Wrapped code that saves image to output_path
        """
        # Default implementation for matplotlib-like libraries
        wrapped = "import io\n\n"
        wrapped += code
        wrapped += "\n\n"
        wrapped += "# Save the image to file\n"
        wrapped += "if 'fig' in dir() or 'plt' in dir():\n"
        wrapped += "    if 'fig' in dir():\n"
        wrapped += f"        fig.savefig('{output_path}', format='png', bbox_inches='tight')\n"
        wrapped += "    else:\n"
        wrapped += "        import matplotlib.pyplot as plt\n"
        wrapped += f"        plt.savefig('{output_path}', format='png', bbox_inches='tight')\n"
        wrapped += "elif 'image_bytes' in dir():\n"
        wrapped += f"    with open('{output_path}', 'wb') as f:\n"
        wrapped += "        f.write(image_bytes)\n"
        wrapped += "else:\n"
        wrapped += "    raise ValueError('Code must define fig, plt, or image_bytes variable')\n"
        
        return wrapped
