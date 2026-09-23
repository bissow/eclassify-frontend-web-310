'use client'
import PageLoader from "@/components/common/PageLoader"
import { useEffect } from "react";

const Loading = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <PageLoader />
    )
}

export default Loading