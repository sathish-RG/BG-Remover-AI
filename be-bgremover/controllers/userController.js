import { Webhook } from 'svix';
import userModel from '../models/userModel.js';

// Controller to manage Clerk webhook events
const clerkWebhooks = async (req, res) => {
  try {
    const svix = new Webhook(process.env.CLERK_WEB_HOOK_SECRET);

    const payload = req.body.toString('utf8'); // convert Buffer to String
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };

    const event = svix.verify(payload, headers); // verified payload

    const { data, type } = event;

    switch (type) {
      case 'user.created': {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        break;
      }
      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        break;
      }
      case 'user.deleted': {
        await userModel.findOneAndDelete({ clerkId: data.id });
        break;
      }
      default:
        console.log('Unhandled event type:', type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
