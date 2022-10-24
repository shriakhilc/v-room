import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

interface HeaderProps {
    session?: Session | null,
    status?: "authenticated" | "loading" | "unauthenticated" | null,
}


class Header extends React.Component<HeaderProps, unknown> {
    render() {
        return (
            <>
                <header className="container mx-auto flex flex-row p-4 border-b-2">
                    <Link href='/classroom/list'>
                        <a className="text-2xl font-extrabold leading-normal">V-Room</a>
                    </Link>
                    {this.props.status === "authenticated" &&
                        (
                            <div className="flex flex-row grow justify-end">
                                <Link href="/user/profile">
                                    <a className="flex flex-row">
                                        {this.props.session?.user?.image != null &&
                                            (
                                                <picture>
                                                    <source srcSet={this.props.session?.user?.image} type="image/webp" />
                                                    <img
                                                        src={this.props.session?.user?.image}
                                                        alt="User avatar"
                                                        className="h-10 w-10 object-cover rounded-full overflow-hidden"
                                                    />
                                                </picture>
                                            )
                                        }
                                        <span className="my-auto mx-1.5 text-md">{this.props.session?.user?.email}</span>
                                    </a>
                                </Link>

                                <button onClick={() => signOut({ callbackUrl: '/' })} className="px-2 py-2 my-auto border-none rounded-md bg-neutral hover:bg-neutral-focus text-white">Sign out</button>
                            </div>
                        )
                    }
                </header>
            </>
        );
    }
}

export default Header;