import Link from "next/link";
import React, { useEffect } from "react";
import Layout from "../components/Layout";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { getError } from "../utils/error";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axios from "axios";

export default function LoginScreen() {
	const { data: session } = useSession();

	const router = useRouter();
	const { redirect } = router.query;

	useEffect(() => {
		if (session?.user) {
			router.push(redirect || "/");
		}
	}, [router, session, redirect]);

	const {
		handleSubmit,
		register,
		getValues,
		formState: { errors },
	} = useForm();

	const submitHandler = async ({ name, email, password, confirmPassword }) => {
		try {
			await axios.post("/api/auth/signup", {
				name,
				email,
				password,
			});
			const result = await signIn("credentials", {
				redirect: false,
				name,
				email,
				password,
				confirmPassword,
			});
			if (result.error) {
				toast.error(result.error);
			}
		} catch (err) {
			toast.error(getError(err));
		}
	};

	return (
		<Layout title='Create Account'>
			<form
				className='mx-auto max-w-screen'
				onSubmit={handleSubmit(submitHandler)}
			>
				<h1 className='mb-4 text-xl'>Login</h1>
				<div className='mb-4'>
					<label htmlFor='name'>Name</label>
					<input
						type='text'
						{...register("name", {
							required: "Please enter name",
						})}
						className='w-full'
						id='name'
						autoFocus
					></input>
					{errors.name && (
						<div className='text-red-500'>{errors.name.message}</div>
					)}
				</div>
				<div className='mb-4'>
					<label htmlFor='email'>Email</label>
					<input
						type='email'
						{...register("email", {
							required: "Please enter email",
							pattern: {
								value: /^[a-zA-Z0-9.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]/i,
								message: "Please enter valid email",
							},
						})}
						className='w-full'
						id='email'
						autoFocus
					></input>
					{errors.email && (
						<div className='text-red-500'>{errors.email.message}</div>
					)}
				</div>
				<div className='mb-4'>
					<label htmlFor='password'>Password</label>
					<input
						type='password'
						{...register("password", {
							required: "Please enter password",
							minLength: {
								value: 6,
								message: "password should be more than 6 characters",
							},
						})}
						className='w-full'
						id='password'
					></input>
					{errors.password && (
						<div className='text-red-500'>{errors.password.message}</div>
					)}
				</div>
				<div className='mb-4'>
					<label htmlFor='confirmPassword'>Confirm Password</label>
					<input
						type='password'
						id='confirmPassword'
						className='w-full'
						{...register("confirmPassword", {
							required: "Please enter confirm password",
							validate: (value) => value === getValues("password"),
							minLength: {
								value: 6,
								message: "confirmPassword should be more than 6 characters",
							},
						})}
					></input>
					{errors.confirmPassword && (
						<div className='text-red-500'>{errors.confirmPassword.message}</div>
					)}
					{errors.confirmPassword &&
						errors.confirmPassword.type === "validate" && (
							<div className='text-red-500'>Password does not match</div>
						)}
				</div>
				<div className='mb-4'>
					<button className='primary-button'>Register</button>
				</div>
				<div className='mb-4'>
					Do you have an acount? &nbsp;
					<Link href='/login'>Login</Link>
				</div>
			</form>
		</Layout>
	);
}
