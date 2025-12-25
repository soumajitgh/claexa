"""
Byte to Base64 adapter for converting image bytes to base64 encoded strings.
"""

import base64
import io
from typing import Union


class ByteToBase64Adapter:
    """Adapter for converting byte data to base64 encoded strings."""
    
    @staticmethod
    def bytes_to_base64(image_bytes: bytes) -> str:
        """
        Convert image bytes to base64 encoded string.
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Base64 encoded string with data URL format
        """
        if not image_bytes:
            raise ValueError("Image bytes cannot be empty")
        
        # Encode bytes to base64
        base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
        
        # Return as data URL (assuming PNG format, can be made configurable)
        return f"data:image/png;base64,{base64_encoded}"
    
    @staticmethod
    def base64_to_bytes(base64_string: str) -> bytes:
        """
        Convert base64 encoded string back to bytes.
        
        Args:
            base64_string: Base64 encoded string (with or without data URL prefix)
            
        Returns:
            Raw image bytes
        """
        if not base64_string:
            raise ValueError("Base64 string cannot be empty")
        
        # Remove data URL prefix if present
        if base64_string.startswith('data:'):
            # Extract the base64 part after the comma
            base64_string = base64_string.split(',', 1)[1]
        
        # Decode base64 to bytes
        return base64.b64decode(base64_string)
    
    @staticmethod
    def is_valid_base64(base64_string: str) -> bool:
        """
        Check if a string is valid base64 encoded.
        
        Args:
            base64_string: String to validate
            
        Returns:
            True if valid base64, False otherwise
        """
        try:
            if base64_string.startswith('data:'):
                base64_string = base64_string.split(',', 1)[1]
            base64.b64decode(base64_string)
            return True
        except Exception:
            return False 