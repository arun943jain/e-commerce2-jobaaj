import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sendOrderConfirmation from "../utils/sendOrderConfirmMail.js";
import tryCatch from "../utils/tryCatch.js";

export const newOrderCod = tryCatch(async(req, res)=>{
    const { method, phone, address } = req.body

    const cart = await Cart.find({user: req.user._id}).populate({
        path: "product",
        select: "title price"
    })

    if(!cart.length) return res.status(400).json({message: "Cart is empty"})

    let subTotal = 0;

    const items = cart.map((i)=>{
        const itemSubtotal = i.product.price * i.quantity;
        subTotal += itemSubtotal;
        
        return {
            product: i.product._id,
            name: i.product.title,
            price: i.product.price,
            quantity: i.quantity
        }
    })

    const order = await Order.create({
        items,
        method,
        user: req.user._id,
        phone,
        address,
        subTotal
    });

    for(let i of order.items){
        const product = await Product.findById(i.product)

        if(product){
            product.stock -= i.quantity;
            product.sold += i.quantity;

            await product.save();
        }
    }

    await Cart.deleteMany({user: req.user._id});

    await sendOrderConfirmation({
        email: req.user.email,
        subject: "Order Confirmation",
        products: items,
        totalAmount: subTotal
    });

    res.json({
        message: "Order created successfully",
        order
    })
});

export const getAllOrders = tryCatch(async(req,res)=>{
    const orders = await Order.find({user: req.user._id})
    res.json({orders: orders.reverse()});
});

export const getAllOrdersAdmin = tryCatch(async(req,res)=>{
    if(req.user.role !== "admin") return res.status(403).json({message: "You are not admin"})
    
    const orders = await Order.find().populate("user").sort({createdAt: -1});

    res.json(orders);
});

export const getMyorder = tryCatch(async(req,res)=>{
    const order = await Order.findById(req.params.id).populate("items.product").populate("user")

    res.json(order);

});

export const updateOrderStatus = tryCatch(async(req,res)=>{
    if(req.user.role !== "admin") return res.status(403).json({message: "You are not admin"})   

    const order = await Order.findById(req.params.id)

    if(!order) return res.status(404).json({message: "Order not found"})

    const { status } = req.body
    order.status = status
    await order.save()

    res.json({message: "Order status updated successfully", order})
})