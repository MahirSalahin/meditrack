import os
import sys

from fastapi.responses import FileResponse

from app.services import file_service

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, HTTPException, logger, status
from fastapi.middleware.cors import CORSMiddleware
from app.middleware import AuthMiddleware
from app.api.main import api_router
from app.core.config import settings

app = FastAPI()

# Add auth middleware
app.add_middleware(AuthMiddleware)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
def read_root():
    return {"message": "Service is running!"}



# ===============================
# FILE SERVING ENDPOINTS
# ===============================

@app.get("/files/{filename}")
async def serve_pdf_file(filename: str):
    """
    Serve PDF files from the uploads directory without authorization.
    This endpoint allows public access to prescription PDFs and other uploaded files.
    """
    try:
        # Get the file path from the file service
        file_path = file_service.get_file_path(filename)
        
        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Return the file
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/pdf"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve file"
        )



# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)
