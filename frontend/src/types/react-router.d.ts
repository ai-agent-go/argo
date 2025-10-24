// 解决 React Router v5 与 React 18 类型兼容性问题
declare module 'react-router-dom' {
  import * as React from 'react';
  
  export interface BrowserRouterProps {
    basename?: string;
    getUserConfirmation?: (message: string, callback: (result: boolean) => void) => void;
    forceRefresh?: boolean;
    keyLength?: number;
    children?: React.ReactNode;
  }
  
  export interface SwitchProps {
    children?: React.ReactNode;
    location?: any;
  }
  
  export interface RouteProps {
    path?: string | string[];
    exact?: boolean;
    strict?: boolean;
    sensitive?: boolean;
    component?: React.ComponentType<any> | any;
    render?: (props: any) => React.ReactNode;
    children?: React.ReactNode | ((props: any) => React.ReactNode);
  }
  
  export interface RedirectProps {
    to: string | { pathname: string; search?: string; hash?: string; state?: any };
    push?: boolean;
    from?: string;
    exact?: boolean;
    strict?: boolean;
    sensitive?: boolean;
  }
  
  export interface LinkProps<S = any> {
    to: string | { pathname: string; search?: string; hash?: string; state?: S };
    replace?: boolean;
    innerRef?: React.Ref<HTMLAnchorElement>;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    draggable?: string;
    [key: string]: any;
  }
  
  export interface PromptProps {
    message: string | ((location: any) => string | boolean);
    when?: boolean;
  }
  
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: any;
    key: string;
  }
  
  export interface History {
    length: number;
    action: string;
    location: Location;
    push: (path: string | { pathname: string; search?: string; hash?: string; state?: any }) => void;
    replace: (path: string | { pathname: string; search?: string; hash?: string; state?: any }) => void;
    go: (n: number) => void;
    goBack: () => void;
    goForward: () => void;
    block: (prompt: any) => () => void;
    listen: (listener: (location: Location, action: string) => void) => () => void;
  }
  
  export interface Match {
    params: { [key: string]: string };
    isExact: boolean;
    path: string;
    url: string;
  }
  
  export const BrowserRouter: React.ComponentType<BrowserRouterProps>;
  export const Switch: React.ComponentType<SwitchProps>;
  export const Route: React.ComponentType<RouteProps>;
  export const Redirect: React.ComponentType<RedirectProps>;
  export const Link: React.ComponentType<LinkProps>;
  export const Prompt: React.ComponentType<PromptProps>;
  
  // Hooks
  export function useHistory(): History;
  export function useLocation(): Location;
  export function useParams<T = { [key: string]: string }>(): T;
  export function useRouteMatch<T = { [key: string]: string }>(path?: string | string[] | { path?: string; exact?: boolean; strict?: boolean; sensitive?: boolean }): Match<T> | null;
}
