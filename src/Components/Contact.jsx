import React from "react";
import Title from "./Title";

export default function Contact() {
    return (
        <div className="flex flex-col mb-10 mx-auto">
            <div className="flex justify-center items-center">
                <form action="https://getform.io/f/raeqmjma" method="POST" className="flex flex-col w-full md:w-7/12">
                    <Title id="contact">Contact</Title>
                    <input type="text" name="Name" placeholder="Your name" className="p-2 bg-transparent border-2 rounded-md focus:outline-none"/>
                    <input type="text" name="Email" placeholder="Your email" className="my-2 p-2 bg-transparent border-2 rounded-md focus:outline-none"/>
                    <textarea name="Message" placeholder="Your message" cols="30" rows="10" className="p-2 mb-4 bg-transparent border-2 rounded-md focus:outline-none"></textarea>
                    <button type="send" className="text-center inline-block px-8 py-3 w-max text-base font-medium rounded-md text-white bg-gradient-to-r from-yellow-500 to-red-500 drop-shadow-md hover:stroke-white">Send</button>
                </form>
            </div>
        </div>
    )
}
