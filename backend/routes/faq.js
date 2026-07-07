const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const dbFallback = require('../services/dbFallback');

// GET /api/faq - Retrieve all FAQs
router.get('/', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      return res.status(200).json(dbFallback.getFAQs());
    }

    const faqs = await FAQ.find().sort({ intent: 1 });
    return res.status(200).json(faqs);
  } catch (error) {
    console.error('[faqRoute] Error retrieving FAQs:', error);
    return res.status(500).json({ error: 'Failed to retrieve FAQs' });
  }
});

// POST /api/faq - Add or update a custom FAQ
router.post('/', async (req, res) => {
  try {
    const { question, answer, intent, category } = req.body;

    if (!question || !answer || !intent) {
      return res.status(400).json({ error: 'Question, answer, and intent are required fields' });
    }

    if (dbFallback.isOffline()) {
      const faq = dbFallback.saveFAQ({ question, answer, intent, category });
      return res.status(200).json({ success: true, faq });
    }

    const faq = await FAQ.findOneAndUpdate(
      { intent: intent.trim() },
      {
        question: question.trim(),
        answer: answer.trim(),
        intent: intent.trim(),
        category: category ? category.trim() : 'General',
        isCustom: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, faq });
  } catch (error) {
    console.error('[faqRoute] Error saving FAQ:', error);
    return res.status(500).json({ error: 'Failed to save FAQ' });
  }
});

// DELETE /api/faq/:id - Delete an FAQ
router.delete('/:id', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      const success = dbFallback.deleteFAQ(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      return res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    await FAQ.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('[faqRoute] Error deleting FAQ:', error);
    return res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
