import * as ReactRouter from 'react-router-dom';
import React, { createContext, useContext } from 'react';

// Use a context to provide Router-related functions safely
const RouterContext = createContext<{
  inRouter: boolean;
  navigate: any;
  location: any;
}>({
  inRouter: false,
  navigate: null,
  location: null,
});

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = ReactRouter.useNavigate();
  const location = ReactRouter.useLocation();

  const value = React.useMemo(
    () => ({
      inRouter: true,
      navigate,
      location,
    }),
    [navigate, location]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const Link = ({ to, href, children, ...props }: any) => {
  const { inRouter } = useContext(RouterContext);
  const toPath = to || href;

  if (inRouter) {
    return (
      <ReactRouter.Link to={toPath} {...props}>
        {children}
      </ReactRouter.Link>
    );
  }
  return (
    <a href={toPath} {...props}>
      {children}
    </a>
  );
};

const LinkDefault = Link;
export default LinkDefault;

export const useNavigate = () => {
  const { inRouter, navigate } = useContext(RouterContext);

  const router = (to: string, options?: any) => {
    if (inRouter && navigate) {
      if (options?.replace) {
        navigate(to, { replace: true });
      } else {
        navigate(to);
      }
    } else {
      if (typeof window !== 'undefined') {
        if (options?.replace) {
          window.location.replace(to);
        } else {
          window.location.href = to;
        }
      }
    }
  };
  router.push = (to: string) => {
    if (inRouter && navigate) navigate(to);
    else if (typeof window !== 'undefined') window.location.href = to;
  };
  router.replace = (to: string) => {
    if (inRouter && navigate) navigate(to, { replace: true });
    else if (typeof window !== 'undefined') window.location.replace(to);
  };
  return router;
};

export const useRouter = useNavigate;

export const usePathname = () => {
  const { inRouter, location } = useContext(RouterContext);

  if (inRouter && location) {
    return location.pathname;
  }
  if (typeof window !== 'undefined') return window.location.pathname;
  return '';
};
