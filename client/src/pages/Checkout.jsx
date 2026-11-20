import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { server } from "@/main";
import axios from "axios";
import Cookies from "js-cookie";
import { Pencil, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Checkout = () => {
  const [address, setAddress] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAddress() {
    try {
      const { data } = await axios.get(`${server}/api/address/all`, {
        headers: {
          token: Cookies.get("token"),
        },
      });

      setAddress(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    address: "",
    phone: "",
  });

  const openAddAddress = () => {
    setEditingAddressId(null);
    setNewAddress({ address: "", phone: "" });
    setModalOpen(true);
  };

  const openEditAddress = (item) => {
    setEditingAddressId(item._id);
    setNewAddress({ address: item.address, phone: String(item.phone) });
    setModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      const url = editingAddressId
        ? `${server}/api/address/${editingAddressId}`
        : `${server}/api/address/new`;
      const method = editingAddressId ? "put" : "post";
      const { data } = await axios[method](
        url,
        { address: newAddress.address, phone: newAddress.phone },
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );

      if (data.message) {
        toast.success(data.message);
        await fetchAddress();
        setNewAddress({ address: "", phone: "" });
        setEditingAddressId(null);
        setModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save address");
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this address")) {
      try {
        const { data } = await axios.delete(`${server}/api/address/${id}`, {
          headers: {
            token: Cookies.get("token"),
          },
        });

        toast.success(data.message);
        fetchAddress();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {address && address.length > 0 ? (
            address.map((e) => (
              <div className="min-w-0 p-4 border rounded-lg shadow-sm" key={e._id}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-lg font-semibold">
                    {e.address}
                  </h3>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Edit address"
                      onClick={() => openEditAddress(e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label="Delete address"
                      onClick={() => deleteHandler(e._id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">Phone- {e.phone}</p>
                <Link to={`/payment/${e._id}`}>
                  <Button variant="outline">Use Address</Button>
                </Link>
              </div>
            ))
          ) : (
            <p>No Address found</p>
          )}
        </div>
      )}

      <Button
        className="mt-6"
        variant="outline"
        onClick={openAddAddress}
      >
        Add New Address
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddressId ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Address"
              required
              value={newAddress.address}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address: e.target.value })
              }
            />
            <Input
              type="tel"
              placeholder="Phone"
              pattern="[0-9]{7,15}"
              value={newAddress.phone}
              required
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={handleSaveAddress}>
              {editingAddressId ? "Save Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
