import pkg from 'svix';
const { Webhook } = pkg;
import userModel from '../models/userModel.js';

// API controller function to manage Clerk user with the database
const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix Webhook instance with Clerk Webhook secret
    const wh = new Webhook(process.env.CLERK_WEB_HOOK_SECRET);

    // FIX: typo in 'headers'
    const evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        res.json({});
        break;
      }
      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }
      case 'user.deleted': {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }
      default: {
        res.status(400).json({ success: false, message: 'Unsupported event type' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
