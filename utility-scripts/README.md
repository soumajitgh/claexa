# Utility Scripts

A collection of utility scripts for document processing and content indexing.

## Content Indexer

The Content Indexer is a tool that processes PDF documents, generates embeddings using Google Gemini AI, stores vectors in Pinecone, and uploads documents to AWS S3.

### Features

- **Document Processing**: Automatically processes PDF files from an input directory
- **AI-Powered Summaries**: Generates document summaries using Google Gemini
- **Vector Embeddings**: Creates embeddings for semantic search capabilities
- **Duplicate Detection**: Uses file hashing to skip already-processed documents
- **Cloud Storage**: Uploads documents to AWS S3
- **Vector Storage**: Stores embeddings in Pinecone vector database
- **Automatic Organization**: Moves processed files to a separate directory

### Prerequisites

- Python 3.13 or higher
- AWS account with S3 access
- Pinecone account and API key
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd utility-scripts
```

2. Install dependencies using uv (recommended) or pip:

```bash
# Using uv
uv sync

# Or using pip
pip install -e .
```

### Configuration

Create a `.env` file in the `scripts/content-indexer` directory with the following variables:

#### Required Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1                    # Your AWS region
S3_BUCKET_NAME=your-bucket-name         # S3 bucket for document storage

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key  # Pinecone API key
VECTOR_INDEX_NAME=your-index-name       # Name of your Pinecone index

# Google Gemini Configuration
GEMINI_API_KEY=your-gemini-api-key      # Google Gemini API key
```

#### Optional Environment Variables

```bash
# AWS Credentials (if not using default credential chain)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Directory Configuration
INPUT_DIRECTORY=input                    # Default: 'input'
PROCESSED_DIRECTORY=processed            # Default: 'processed'
```

**Note**: If `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are not provided, the script will use the default AWS credential chain (environment variables, EC2 instance metadata, AWS SSO, or AWS profile).

### Usage

1. **Prepare your documents**: Place PDF files in the `input` directory (or your configured input directory)

2. **Run the content indexer**:

```bash
cd scripts/content-indexer
python main.py
```

3. **Processing flow**:


   - The script will process each PDF file in the input directory
   - For each document:
     - Generates a hash to check for duplicates
     - Skips if already processed (vector exists in Pinecone)
     - Uploads document to Google Gemini for AI processing
     - Generates a summary using Gemini
     - Creates vector embeddings from the summary
     - Uploads the document to S3
     - Stores the vector in Pinecone
     - Moves the file to the processed directory
   - Continues until all documents are processed

4. **Monitor progress**: The script provides detailed console output showing:


   - Configuration settings
   - Document processing status
   - Generated hashes and summaries
   - Upload confirmations
   - Error messages (if any)

### Directory Structure

```plaintext
content-indexer/
├── __init__.py
├── .env                           # Your configuration file
├── config.py                      # Configuration management
├── main.py                        # Main entry point
├── document.py                    # Document loading utilities
├── hashing.py                     # File hashing for deduplication
├── pinecone_vector_store.py       # Pinecone operations
├── s3_object_storage.py           # S3 upload operations
├── vector_models.py               # Data models for vectors
├── ai/
│   ├── document.py                # AI document upload
│   ├── generation.py              # Summary generation
│   ├── vector_generation.py       # Embedding generation
│   └── prompt/
│       └── summary_system_prompt.txt
├── danger/
│   ├── object_bucket_cleanup.py   # S3 cleanup utility
│   └── vector_store_cleanup.py    # Pinecone cleanup utility
├── input/                         # Place PDF files here
└── processed/                     # Processed files moved here
```

### Error Handling

The script includes robust error handling:

- **Missing Configuration**: Clear error messages for missing environment variables
- **Duplicate Documents**: Automatically skips documents that have already been processed
- **Processing Errors**: Continues processing remaining documents if one fails
- **AWS Credentials**: Falls back to default credential chain if explicit credentials not provided

### Cleanup Utilities

⚠️ **Warning**: The `danger/` directory contains cleanup scripts that delete data. Use with caution!

- `object_bucket_cleanup.py`: Removes documents from S3 bucket
- `vector_store_cleanup.py`: Removes vectors from Pinecone index

### Troubleshooting

**Configuration Errors**:

- Ensure all required environment variables are set in your `.env` file
- Check that your `.env` file is in the correct directory

**AWS Errors**:

- Verify your AWS credentials are valid
- Ensure the S3 bucket exists and you have write permissions
- Check that the AWS region is correct

**Pinecone Errors**:

- Verify your Pinecone API key is valid
- Ensure the vector index exists and matches the configured name
- Check that your index dimensions match the embedding size

**Gemini API Errors**:

- Verify your Google Gemini API key is valid
- Check that you have sufficient API quota

### Example Output

```plaintext
Using default AWS credential chain (env/IMDS/SSO/profile)
Starting document processing...
AWS Region: us-east-1
Document Bucket: my-document-bucket
Vector Index (Pinecone): my-vector-index
Input Directory: input
Processed Directory: processed

--- Processing Document 1 ---
Found document: input/sample.pdf
Generated file hash: abc123def456...
Uploaded document to AI: sample.pdf
Generated summary: This document discusses...
Generated embeddings: <class 'list'>
Document uploaded to S3: s3://my-document-bucket/abc123def456
Vector stored successfully in Pinecone
Document moved to processed directory: processed
Successfully processed document 1

No more documents found. Processed 1 documents total.

Document processing completed. Total documents processed: 1
```

### License

See the repository license for details.
