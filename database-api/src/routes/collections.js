const express = require('express');
const collectionsController = require('../controllers/collections');

const router = express.Router();

/**
 * @route GET /collections
 * @description Get all collections
 */
router.get('/', collectionsController.getAllCollections);

/**
 * @route POST /collections
 * @description Create a new collection
 */
router.post('/', collectionsController.createCollection);

/**
 * @route GET /collections/:id
 * @description Get a collection by ID
 */
router.get('/:id', collectionsController.getCollectionById);

/**
 * @route PUT /collections/:id
 * @description Update a collection
 */
router.put('/:id', collectionsController.updateCollection);

/**
 * @route DELETE /collections/:id
 * @description Delete a collection
 */
router.delete('/:id', collectionsController.deleteCollection);

/**
 * @route GET /collections/:id/documents
 * @description Get all documents in a collection
 */
router.get('/:id/documents', collectionsController.getAllDocuments);

/**
 * @route POST /collections/:id/documents
 * @description Create a new document in a collection
 */
router.post('/:id/documents', collectionsController.createDocument);

/**
 * @route GET /collections/:id/documents/:documentId
 * @description Get a document by ID
 */
router.get('/:id/documents/:documentId', collectionsController.getDocumentById);

/**
 * @route PUT /collections/:id/documents/:documentId
 * @description Update a document
 */
router.put('/:id/documents/:documentId', collectionsController.updateDocument);

/**
 * @route DELETE /collections/:id/documents/:documentId
 * @description Delete a document
 */
router.delete('/:id/documents/:documentId', collectionsController.deleteDocument);

module.exports = router;