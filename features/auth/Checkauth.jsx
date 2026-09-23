"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "@/components/common/Loader";
import { usePathname } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";

const Checkauth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const pathname = usePathname();
    const { navigate } = useNavigate();
    const user = useSelector((state) => state.UserSignup.data);
    // Waits for persisted auth to rehydrate before trusting `user`.
    const rehydrated = useSelector((state) => state._persist?.rehydrated ?? true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      if (!rehydrated) return;

      // List of routes that require authentication
      const privateRoutes = [
        "/profile",
        "/ad-listing",
        "/notifications",
        "/chat",
        "/user-subscription",
        "/my-ads",
        "/favorites",
        "/transactions",
        "/reviews",
        "/edit-listing",
        "/user-verification",
        "/job-applications",
      ];
      const isPrivateRoute = privateRoutes.some(
        (route) => pathname.endsWith(route) || pathname.includes(`${route}/`)
      );

      // If it's a private route and user is not authenticated
      if (isPrivateRoute && !user) {
        navigate("/");
        return;
      }

      // If user is authenticated or it's not a private route
      setIsAuthorized(true);
      setAuthChecked(true);
    }, [user, rehydrated, pathname]);

    // Show loader until auth check completes
    if (!authChecked) {
      return <Loader />;
    }

    // Only render the component if user is authorized
    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};

export default Checkauth;
