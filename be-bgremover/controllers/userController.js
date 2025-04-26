import { Webhook } from 'svix';
import userModel from '../models/userModel.js';

// API controller function to manage Clerk user with database
// http://localhost:4000/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    // Create a svix webhook instance with Clerk webhook secret
    const wh = new Webhook(process.env.CLERK_WEB_HOOK_SECRET);

    // Verify webhook signature (must use raw body)
    const payloadString = JSON.stringify(req.body);
    wh.verify(payloadString, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        res.json({ success: true, message: "User created" });
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({ success: true, message: "User updated" });
        break;
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({ success: true, message: "User deleted" });
        break;
      }
      default: {
        res.status(400).json({ success: false, message: "Unhandled event type" });
        break;
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
