from __future__ import annotations

from typing import Dict, List, Optional
import uuid
import os


class VectorStore:
    """Lightweight local vector store backed by ChromaDB."""

    def __init__(
        self,
        collection_name: str = "default_collection",
        persist_directory: Optional[str] = None,
    ) -> None:
        """Initialize the ChromaDB collection and embedder.
        Args:
            collection_name: Name of the ChromaDB collection to use.
            persist_directory: Local directory to persist vectors.
        """
        import chromadb
        from app.mcp.embedder import Embedder

        if persist_directory is None:
            persist_directory = os.path.join(os.getcwd(), "chromadb")
        
        # Use new ChromaDB PersistentClient API
        self._client = chromadb.PersistentClient(path=persist_directory)
        
        # Always create or get the collection
        self._collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

        self._embedder = Embedder()

    def add_documents(self, texts: List[str], metadatas: List[Dict]) -> List[str]:
        """Add documents, metadata and ids to the vector store.
        Args:
            texts: List of document text strings.
            metadatas: List of metadata dictionaries, e.g. source URL.

        Returns:
            A list of generated ids for the inserted documents.
        """
        if not isinstance(texts, list) or not isinstance(metadatas, list):
            raise TypeError("texts and metadatas must both be lists")

        if len(texts) != len(metadatas):
            raise ValueError("texts and metadatas must have the same length")

        ids = [str(uuid.uuid4()) for _ in texts]
        embeddings = self._embedder.embed(texts)

        self._collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas,
            embeddings=embeddings,
        )

        return ids

    def query(self, query_text: str, n_results: int = 3) -> List[Dict]:
        """Query the vector store and return the top relevant documents.
        Args:
            query_text: Query string to search for.
            n_results: Number of nearest neighbors to return.

        Returns:
            List of result dicts containing id, document, metadata, and distance.
        """
        if not isinstance(query_text, str):
            raise TypeError("query_text must be a string")

        query_embedding = self._embedder.embed([query_text])[0]

        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        documents = []
        for idx in range(len(results.get("documents", [[]])[0] if results.get("documents") else [])):
            documents.append(
                {
                    "document": results.get("documents", [[]])[0][idx],
                    "metadata": results.get("metadatas", [[]])[0][idx],
                    "distance": results.get("distances", [[]])[0][idx],
                }
            )

        return documents
