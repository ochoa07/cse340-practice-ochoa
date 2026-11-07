import { validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

// Display the contact form
const showContactForm = (req, res) => {
  res.render('forms/contact/form', {
    title: 'Contact Us'
  });
};

// Validate and save a submission
const handleContactSubmission = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    for (const error of errors.array()) {
      req.flash('error', error.msg);
    }

    return res.redirect('/contact');
  }

  const { subject, message } = req.body;

  try {
    await createContactForm(subject, message);
    req.flash('success', 'Your message was sent successfully.');
    return res.redirect('/contact/responses');
  } catch (error) {
    console.error('Error saving contact form:', error);
    return res.redirect('/contact');
  }
};

// Display saved submissions
const showContactResponses = async (req, res) => {
  let contactForms = [];

  try {
    contactForms = await getAllContactForms();
  } catch (error) {
    console.error('Error retrieving contact forms:', error);
  }

  res.render('forms/contact/responses', {
    title: 'Contact Form Submissions',
    contactForms
  });
};

export { showContactForm, handleContactSubmission, showContactResponses };