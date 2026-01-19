const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const orderModel = require('../models/order')
const cartModel = require('../models/cart')
const productModel = require('../models/products')


async function getStripePayment(req, res) {
  try {
    const { orderId } = req.params
    const order = await orderModel.findById(orderId).populate("items.product")

    if (!order || order.paymentMethod !== "Card") {
      return res.redirect("/checkout")
    }

    if (!order.items || order.items.length === 0) {
      return res.redirect("/checkout")
    }

    const line_items = order.items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name  
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }))

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      metadata: {
        orderId: order._id.toString(),
        userId: order.userId.toString()
      },
      success_url: `${req.protocol}://${req.get("host")}/order/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/checkout`
    })

    return res.redirect(303, session.url)

  } catch (error) {
    console.log(error)
    return res.redirect("/checkout")
  }
}




async function stripeWebhook(req,res) {
  
  console.log("stripeWebhook - received event");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET_KEY
    );
    console.log("stripeWebhook - event type:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        
        const order = await orderModel.findById(orderId);
        if (!order) {
          console.warn("Order not found for webhook:", orderId);
          break;
        }

        
        if (order.paymentStatus !== "Paid") {
          order.paymentStatus = "Paid";
          order.orderStatus = "Pending";
          order.stripePaymentIntentId = session.payment_intent;
          await order.save();

          
          for (const item of order.items) {
            await productModel.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } }
            );
          }

          if (order.coupon && order.coupon.code) {
            const couponModel = require('../models/coupon');
            await couponModel.updateOne(
              { code: order.coupon.code },
              { $addToSet: { usedBy: order.userId } }
            );
          }

          
          await cartModel.updateOne(
            { userId: order.userId },
            {
              $set: {
                products: [],
                couponApplied: false,
                couponCode: null,
                couponDiscount: 0
              }
            }
          );

        }

        console.log("checkout.session.completed handled for order:", orderId);
        break;
      }

      case "payment_intent.payment_failed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await orderModel.findByIdAndUpdate(orderId, {
            paymentStatus: "Failed"
          });
          console.log("payment_intent.payment_failed handled for order:", orderId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handling error:", err);
    return res.sendStatus(500);
  }

  
  res.json({ received: true });
}  


async function stripeSuccess(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"]
    });

    const orderId = session.metadata?.orderId;
    if (!orderId) throw new Error("Missing orderId in Stripe metadata");

    const order = await orderModel
  .findById(orderId)
  .populate("items.product")
  .populate("userId")
  .populate("address")

    if (!order) throw new Error("Order not found");

    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Placed";
      order.stripePaymentIntentId =
        session.payment_intent?.id || null

      await order.save()

      if (order.coupon && order.coupon.code) {
        const couponModel = require('../models/coupon');
        await couponModel.updateOne(
          { code: order.coupon.code },
          { $addToSet: { usedBy: order.userId } }
        );
      }
    }
    await cartModel.updateOne(
  { userId: order.userId._id },
  {
    $set: {
      products: [],
      couponApplied: false,
      couponCode: null,
      couponDiscount: 0
    }
  }
);

    const userName =
      order.userId?.name ||
      order.address?.name ||
      "Customer";

    return res.render("user/order", {
      order,
      userName,
      error: null
    });

  } catch (err) {
    console.error("Stripe Success Error:", err.message);

    return res.render("user/order", {
      order: null,
      userName: null,
      error: "Payment succeeded, but we couldn't load your order details."
    });
  }
}

















































module.exports = {
    getStripePayment,
    stripeWebhook,
    stripeSuccess
}