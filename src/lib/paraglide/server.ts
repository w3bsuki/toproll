export type ParaglideHandler = (context: { request: Request; locale: string }) => Response | Promise<Response>;

export function paraglideMiddleware(request: Request, handler: ParaglideHandler) {
        const locale = request.headers.get('accept-language')?.split(',')[0]?.trim() || 'en';
        return handler({ request, locale });
}
