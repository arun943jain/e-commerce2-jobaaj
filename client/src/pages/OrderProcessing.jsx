import { Button } from "@/components/ui/button";
import { CartData } from "@/context/CartContext";
import { server } from "@/main";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const OrderProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isCod, setIsCod] = useState(false);
  const { fetchCart } = CartData();
  const requested = useRef(false);

  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");
  const codOrderId = queryParams.get("order_id");

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const confirmOrder = async () => {
      if (sessionId) {
        try {
          const { data } = await axios.post(
            `${server}/api/order/verify/payment`,
            { sessionId },
            {
              headers: {
                token: Cookies.get("token"),
              },
            }
          );

          if (data.success) {
            setOrderId(data.order?._id || "");
            fetchCart();
            toast.success("Order Placed successfully");
          } else {
            setError(data.message || "Payment verification failed");
          }
        } catch (verifyError) {
          setError(
            getErrorMessage(
              verifyError,
              "Payment verification failed. Please try again"
            )
          );
        } finally {
          setLoading(false);
        }

        return;
      }

      if (codOrderId) {
        try {
          const { data } = await axios.get(`${server}/api/order/${codOrderId}`, {
            headers: {
              token: Cookies.get("token"),
            },
          });

          setOrderId(data._id);
          setIsCod(true);
          toast.success("Order Placed successfully");
        } catch (orderError) {
          setError(getErrorMessage(orderError, "Could not confirm the order"));
        } finally {
          setLoading(false);
        }

        return;
      }

      toast.error("Session Id missing");
      navigate("/cart");
    };

    confirmOrder();
  }, [sessionId, codOrderId, fetchCart, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-500">
      {loading ? (
        <>
          <div className="bg-white p-8 rounded-lg shadow-lg text-clip max-w-lg">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
              Processing Order
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Please wait while we process your payment and order
            </p>
            <Loader />
            <div className="text-xl text-gray-500">Processing...</div>
          </div>
        </>
      ) : error ? (
        <>
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div>
              <h1 className="text-4xl font-bold text-red-500 mb-4">
                Payment Not Completed
              </h1>

              <p className="text-gray-600 text-lg mb-6">{error}</p>

              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => navigate("/cart")}>Back to cart</Button>
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  Go to order page
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div>
              <h1 className="text-4xl font-bold text-green-500 mb-4">
                Order Placed
              </h1>

              <p className="text-gray-600 text-lg mb-6">
                {isCod
                  ? "Thank you for shopping with us. Your cash on delivery order is confirmed."
                  : "Thank you for shopping with us. Your payment was successful and your order is confirmed."}
              </p>

              <Button
                onClick={() =>
                  navigate(orderId ? `/order/${orderId}` : "/orders")
                }
              >
                Go to order page
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderProcessing;
