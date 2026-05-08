import express from 'express';
const router = express.Router();

router.get('/vendors', (req, res) => {
  const vendors = [
    {
      id: 'instacart',
      name: 'Instacart',
      description: 'Fast delivery from local stores like Publix, Aldi, and Costco.',
      color: '#24be71',
      features: ['Automated Search', 'Price Comparison', 'Local Stores'],
      affiliateUrl: process.env.INSTACART_AFFILIATE_URL || 'https://www.instacart.com/',
      subStores: [
        { id: 'publix', name: 'Publix', logo: 'https://www.instacart.com/assets/domains/store_configuration/logo/1/white_bg_4b58e778-04f1-4682-9571-06798031d7b3.png' },
        { id: 'aldi', name: 'Aldi', logo: 'https://www.instacart.com/assets/domains/store_configuration/logo/12/white_bg_9033327d-5a8b-4b14-8703-9f5e27a13d7a.png' },
        { id: 'sams_club', name: 'Sam\'s Club', logo: 'https://www.instacart.com/assets/domains/store_configuration/logo/131/white_bg_a3f8c057-04f1-4682-9571-06798031d7b3.png' },
        { id: 'costco', name: 'Costco', logo: 'https://www.instacart.com/assets/domains/store_configuration/logo/5/white_bg_3f5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e.png' }
      ]
    },
    {
      id: 'walmart',
      name: 'Walmart',
      description: 'Great prices on bulk items and everyday essentials.',
      color: '#0071dc',
      features: ['Lowest Prices', 'Bulk Savings', 'Reliable Delivery'],
      affiliateUrl: process.env.WALMART_AFFILIATE_URL || 'https://www.walmart.com/'
    }
  ];

  res.json({ success: true, vendors });
});

export default router;
