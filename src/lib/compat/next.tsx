import * as ReactRouter from 'react-router-dom';
import React from 'react';

// Use a dynamic check to see if we're in a Router context
function useInRouter() {
  try {
    // This is a bit of a hack, but should work to detect if we're inside a Router
    ReactRouter.useLocation();
    return true;
  } catch (e) {
    return false;
  }
}

export const Link = ({ to, href, children, ...props }: any) => {
  const inRouter = useInRouter();
  if (inRouter) {
    return <ReactRouter.Link to={to || href} {...props}>{children}</ReactRouter.Link>;
  }
  return <a href={to || href} {...props}>{children}</a>;
};

const LinkDefault = Link;
export default LinkDefault;

export const useNavigate = () => {
  const inRouter = useInRouter();
  const navigate = inRouter ? ReactRouter.useNavigate() : (() => {});

  const router = (to: string, options?: any) => {
    if (inRouter) {
      if (options?.replace) {
        navigate(to, { replace: true });
      } else {
        navigate(to);
      }
    } else {
       if (typeof window !== 'undefined') window.location.href = to;
    }
  };
  router.push = (to: string) => {
    if (inRouter) navigate(to);
    else if (typeof window !== 'undefined') window.location.href = to;
  };
  router.replace = (to: string) => {
    if (inRouter) navigate(to, { replace: true });
    else if (typeof window !== 'undefined') window.location.replace(to);
  };
  return router;
};

export const useRouter = useNavigate;

export const usePathname = () => {
  const inRouter = useInRouter();
  if (inRouter) {
    return ReactRouter.useLocation().pathname;
  }
  if (typeof window !== 'undefined') return window.location.pathname;
  return '';
};
