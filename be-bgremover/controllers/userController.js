import pkg from 'svix';
const { Webhook } = pkg;
import userModel from '../models/userModel.js';

const clerkWebhooks = async (req, res) => {
  try {
    // Initialize Svix Webhook with your Clerk Webhook secret
    const wh = new Webhook(process.env.CLERK_WEB_HOOK_SECRET);

    // Verify the incoming webhook using the raw body and headers
    const evt = wh.verify(req.body, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    // Extract event type and data from the verified event
    const { data, type } = evt;

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
        res.status(200).json({ success: true, message: 'User created successfully' });
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
        res.status(200).json({ success: true, message: 'User updated successfully' });
        break;
      }
      case 'user.deleted': {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.status(200).json({ success: true, message: 'User deleted successfully' });
        break;
      }
      default: {
        res.status(400).json({ success: false, message: `Unhandled event type: ${type}` });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

export { clerkWebhooks };
