/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";

export default function ProductItem({
	product: { image, slug, name, brand, price },
}) {
	return (
		<div className='card'>
			<Link href={`/product/${slug}`}>
				<a>
					<img scr={image} alt={name} className='rounded shadow' />
				</a>
			</Link>
			<div className='flex flex-col items-center justify-center p-5'>
				<Link href={`/product/${slug}`}>
					<a>
						<h2 className='text-lg'>{name}</h2>
					</a>
				</Link>
				<p className='mb-2'>{brand}</p>
				<p>${price}</p>
				<button className='primary-button' type='button'>
					Add To Cart
				</button>
			</div>
		</div>
	);
}
