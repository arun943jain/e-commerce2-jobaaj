import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const ProductCard = ({ product, latest }) => {
  const navigate = useNavigate();
  return (
    <div>
      {product && (
        <div className="mx-auto w-full max-w-[300px] min-w-0 shadow-md rounded-lg overflow-hidden border border-gray-200">
          <Link to={`/product/${product._id}`}>
            <div className="relative aspect-square w-full bg-gray-100 flex justify-center items-center overflow-hidden">
              <img
                src={product.images?.[0]?.url || "/not found.png"}
                alt={product.title ? `${product.title} product` : "Product"}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/not found.png";
                }}
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
              />
              {latest === "yes" && (
                <Badge
                  className={"absolute top-2 left-2 bg-green-500 text-white"}
                >
                  New
                </Badge>
              )}
            </div>
          </Link>

          <div className="p-4">
            <h3 className="text-lg font-semibold truncate">
              {product.title.slice(0, 30)}
            </h3>
            <p className="text-sm mt-1 truncate">
              {(product.about || product.features || "").slice(0, 30)}
            </p>
            <p className="text-sm mt-1 truncate">₹ {product.price}</p>

            <div className="flex items-center justify-center mt-4">
              <Button onClick={() => navigate(`/product/${product._id}`)}>
                View Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
