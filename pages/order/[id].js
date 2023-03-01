"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { getError } from "../../utils/error";
import Image from "next/image";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { data } from "autoprefixer";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
    default:
      state;
  }
}

function OrderScreen() {
  const { data: session } = useSession();
  const { query } = useRouter();
  const orderId = query.id;
  // const [isPending, setIsPending] = useState(false);

  const [{ loading, error, order, loadingDeliver }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      order: {},
      error: "",
    }
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [order, orderId]);

  const {
    shippingAddress,

    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isdDelivered,
    deliveredAt,
  } = order;

  // function createOrder(data, actions) {
  //   return actions.order
  //     .create({
  //       purchase_units: [
  //         {
  //           amount: { value: totalPrice },
  //         },
  //       ],
  //     })
  //     .then((orderID) => {
  //       return orderID;
  //     });
  // }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/deliver`,
        {}
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is delivered");
    } catch (err) {
      dispatch({ type: "DELIVER_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
    console.log(data);
  }

  // function onApprove(data, actions) {
  //   return actions.order.capture().then(async function (details) {
  //     try {
  //       dispatch({ type: "PAY_REQUEST" });
  //       const { data } = await axios.put(
  //         `/api/orders/${order._id}/pay`,
  //         details
  //       );
  //     } catch (err) {
  //       dispatch({ type: "PAY_FAIL", payload: getError(err) });
  //       toast.error(getError(err));
  //     }
  //   });
  // }

  // function onError(err) {
  //   toast.error(getError(err));
  // }
  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className="mb-4 text-xl ">{`Order ${orderId}`}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress.fullName},{shippingAddress.address},
                {shippingAddress.contactNumber}
              </div>
              {isdDelivered ? (
                <div className="alert-success">Delivered at {deliveredAt}</div>
              ) : (
                <div className="alert-error">Not delivered</div>
              )}
            </div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              {isPaid ? (
                <div className="alert-success">Paid at {paidAt}</div>
              ) : (
                <div className="alert-error">Cash on delivery</div>
              )}
            </div>
            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="p-5 text-right">Quantity</th>
                    <th className="p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <div className="flex items-center">
                            <div className="h-20 p-6 rounded-lg overflow-hidden relative ">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                style={{
                                  objectFit: "contain",
                                  objectPosition: "center",
                                }}
                                className="rounded shadow"
                              />
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">₱{item.price}</td>
                      <td className="p-5 text-right">
                        ₱{item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>₱{itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Tax</div>
                    <div>₱{taxPrice}</div>
                  </div>
                </li>
                <li className="mb-2 flex justify-between">
                  <div>Shipping</div>
                  <div>{shippingPrice}</div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>₱{totalPrice}</div>
                  </div>
                </li>

                <li>
                  {loadingDeliver && <div>Loading...</div>}
                  <button
                    className="primary-button w-full"
                    onClick={deliverOrderHandler}
                  >
                    Deliver Order
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderScreen.auth = true;
export default OrderScreen;
