export const PAYMENT_CURRENCY = "inr";

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

export const normalizeOnlineOrderInput = ({ method, phone, address }) => {
  if (String(method ?? "").toLowerCase() !== "online") {
    throw badRequest("Only online payment is supported");
  }

  const trimmedAddress = String(address ?? "").trim();
  const phoneValue = String(phone ?? "").trim();

  if (!trimmedAddress || !/^\d{7,15}$/.test(phoneValue)) {
    throw badRequest("A valid phone number and address are required");
  }

  return { address: trimmedAddress, phone: Number(phoneValue) };
};

export const buildOrderItems = (cart) => {
  const items = [];

  for (const entry of cart) {
    const price = Number(entry.product.price);
    const quantity = Number(entry.quantity);

    if (!Number.isFinite(price) || price < 0) {
      throw badRequest("Product price is invalid");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw badRequest("Product quantity is invalid");
    }

    if (quantity > entry.product.stock) {
      return { unavailable: entry.product.title };
    }

    items.push({
      product: entry.product._id,
      name: entry.product.title,
      price,
      images: entry.product.images,
      quantity,
    });
  }

  const subTotal =
    items.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0
    ) / 100;

  return { items, subTotal };
};

export const buildStripeLineItems = (items) =>
  items.map((item) => {
    const image = item.images?.[0]?.url;

    return {
      price_data: {
        currency: PAYMENT_CURRENCY,
        product_data: {
          name: item.name,
          ...(typeof image === "string" && /^https?:\/\//i.test(image)
            ? { images: [image] }
            : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

export const isPaidSession = (session) =>
  session?.payment_status === "paid";

export const sessionMatchesOrder = (session, order) => {
  if (!session || !order) return false;

  const metadata = session.metadata || {};
  const expectedAmount = Math.round(Number(order.subTotal) * 100);
  const orderUserId = order.user?._id
    ? String(order.user._id)
    : String(order.user);

  return (
    metadata.orderId === String(order._id) &&
    metadata.userId === orderUserId &&
    session.amount_total === expectedAmount &&
    String(session.currency || "").toLowerCase() === PAYMENT_CURRENCY
  );
};
