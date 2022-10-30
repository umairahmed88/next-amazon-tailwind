import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CheckoutWizard from "../components/CheckoutWizard";
import Layout from "../components/Layout";
import { getError } from "../utils/error";
import { Store } from "../utils/Store";

export default function PlaceOrderScreen() {
	const { state, dispatch } = useContext(Store);
	const { cart } = state;
	const { cartItems, shippingAddress, paymentMethod } = cart;

	const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

	const itemsPrice = round2(
		cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
	);

	const shippingPrice = itemsPrice > 200 ? 0 : 15;
	const taxPrice = round2(itemsPrice * 0.15);
	const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

	const router = useRouter();
	useEffect(() => {
		if (!paymentMethod) {
			Router.push("/payment");
		}
	}, [paymentMethod, router]);

	const [loading, setloading] = useState(false);

	const placeOrderHandler = async () => {
		try {
			setloading(true);
			const { data } = await axios.post("/api/orders", {
				orderItems: cartItems,
				shippingAddress,
				paymentMethod,
				itemsPrice,
				shippingPrice,
				taxPrice,
				totalPrice,
			});
			setloading(false);
			dispatch({ type: "CLEAR_CART_ITEMS" });
			Cookies.set(
				"cart",
				JSON.stringify({
					...cart,
					cartItems: [],
				})
			);

			router.push(`/order/${data._id}`);
		} catch (err) {
			setloading(false);
			toast.error(getError(err));
		}
	};

	const { fullName, address, city, psotalCode, country } = shippingAddress;
	return (
		<Layout title='Place Order'>
			<CheckoutWizard activeStep={3} />
			<h1 className='mb-4 text-xl'>Place Order</h1>
			{cartItems.length === 0 ? (
				<div>
					Cart is empty. <Link>Go Shopping</Link>
				</div>
			) : (
				<div className='grid md:grid-cols-4 md:gap-5'>
					<div className='overflow-x-auto md:col-span-3'>
						<div className='card p-5'>
							<h2 className='mb-2 text-lg'>Shipping Address</h2>
							<div>
								{fullName}, {address}, {city}, {psotalCode}, {country}
							</div>
							<div>
								<Link href='/shipping'>Edit</Link>
							</div>
						</div>
						<div className='card p-5'>
							<h2 className='mb-2'>Payment Method</h2>
							<div>{paymentMethod}</div>
							<div>
								<Link href='/payment'>Edit</Link>
							</div>
						</div>
						<div className='card overflow-x-auto p-5'>
							<h2 className='mb-2 text-lg'>Order Items</h2>
							<table className='min-w-full'>
								<thead>
									<tr>
										<th className='px-5 text-left'>Item</th>
										<th className='p-5 text-right'>Quantity</th>
										<th className='p-5 text-right'>Price</th>
										<th className='p-5 text-right'>Subtotal</th>
									</tr>
								</thead>
								<tbody>
									{cartItems.map((item) => (
										<tr key={item._id} className='border-b'>
											<td>
												<Link href={`/product/${item.slug}`}>
													<a className='flex items-center'>
														<Image
															alt={item.name}
															src={item.image}
															width={50}
															height={50}
														></Image>
														&nbsp;
														{item.name}
													</a>
												</Link>
											</td>
											<td className='p-5 text-right'>{item.quantity}</td>
											<td className='p-5 text-right'>{item.price}</td>
											<td className='p-5 text-right'>
												${item.quantity * item.price}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<div>
								<Link href='/cart'>Edit</Link>
							</div>
						</div>
					</div>
					<div>
						<div className='card p-5'>
							<h2 className='mb-2 text-lg'>Order Summary</h2>
							<ul>
								<li>
									<div className='mb-2 flex justify-between'>
										<div>Items</div>
										<div>${itemsPrice}</div>
									</div>
								</li>
								<li>
									<div className='mb-2 flex justify-between'>
										<div>Tax</div>
										<div>${taxPrice}</div>
									</div>
								</li>
								<li>
									<div className='mb-2 flex justify-between'>
										<div>Total</div>
										<div>${totalPrice}</div>
									</div>
								</li>
								<li>
									<button
										disabled={loading}
										onClick={placeOrderHandler}
										className='primary-button w-full'
									>
										{loading ? "Loading..." : "Place Order"}
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

PlaceOrderScreen.auth = true;
