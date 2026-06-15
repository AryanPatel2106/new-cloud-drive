import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Where are my files stored?',
    a: 'All files are stored securely in high-availability, enterprise-grade cloud storage with multiple redundancy zones to protect against data loss.',
  },
  {
    q: 'How secure is CloudDrive?',
    a: 'Every login is protected by instant identity validation. All user sessions are encrypted, and file access links expire automatically to keep your drive secure.',
  },
  {
    q: 'What is the maximum file upload size?',
    a: 'Each file can be up to 10 MB. This limit helps ensure fast uploads and reliable performance for all users.',
  },
  {
    q: 'Can I rename or delete files after uploading?',
    a: 'Yes. You can rename files from your dashboard at any time. Deleting a file removes it from your drive permanently to free up space.',
  },
  {
    q: 'Is CloudDrive free to use ?',
    a: 'CloudDrive is a personal cloud storage platform. You can create a free account and start uploading files immediately.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container text-center">
        <span className="section-label">FAQ</span>
        <h2 className="section-title" id="faq-heading">
          Frequently asked questions
        </h2>
        <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
          Got questions? Here are answers to the most common ones about CloudDrive.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.q} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  {faq.q}
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
