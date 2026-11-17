import './config/cloudinary.js'
import express from 'express'
import connectDb from './config/db.js'
import userRoutes from './routes/user.js'
import productRoutes from './routes/product.js'
import cartRoutes from './routes/cart.js'
import addressRoutes from './routes/address.js'
import orderRoutes from './routes/order.js'

const app = express()

app.use(express.json())

app.use("/api", userRoutes)

app.use("/api", productRoutes)

app.use("/api", cartRoutes)

app.use("/api", addressRoutes)

app.use("/api", orderRoutes)

const port = process.env.PORT || 5000


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb()
})