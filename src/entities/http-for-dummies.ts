/**
 * Some HTTP-related utilities.
 */

import { ProjectRequestSpec } from "@/entities/project-entities";
import { RequestSnapshot } from "./runtime-entities";

export function isRequestingToLocalhost(request: RequestSnapshot): boolean {
  return [
    "http://localhost",
    "https://localhost",
    "http://127.0.0.1",
    "https://127.0.0.1",
  ].some((localBeginning) => request.url.startsWith(localBeginning));
}

export function canMethodHaveBody(method: RequestSnapshot["method"]): boolean {
  return method !== "GET" && method !== "HEAD";
}

/** HTTP methods but as constants. */
export const HTTP_METHODS: ProjectRequestSpec["method"][] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

/**
 * Get brief explanation of each HTTP method.
 * (Thanks, Chat GPT 4.)
 */
export function getMethodExplanation(
  method: ProjectRequestSpec["method"]
): string {
  switch (method) {
    case "GET":
      return "GET requests are used to retrieve data from a specified resource. They should not change the state of the resource, making them safe and idempotent.";
    case "POST":
      return "POST requests are used to submit data to be processed to a specified resource. They can change the state and are not idempotent.";
    case "PUT":
      return "PUT requests are used to send data to a server to create/update a resource. The difference between PUT and POST is that PUT requests are idempotent, meaning that multiple identical requests should have the same effect as a single one.";
    case "PATCH":
      return "PATCH requests are used to apply partial modifications to a resource. Unlike PUT, PATCH is not idempotent, which means successive identical requests may have different effects.";
    case "DELETE":
      return "DELETE requests are used to delete the specified resource. They change the state of the resource and are idempotent, as multiple identical requests will have the same effect.";
    case "HEAD":
      return "HEAD requests are similar to GET requests, but without the response body. It is used to retrieve the headers for a specific resource, useful for checking if the resource exists before downloading it.";
    case "OPTIONS":
      return "OPTIONS requests are used to describe the communication options for the target resource. It allows the client to determine the options and/or requirements associated with a resource, or the capabilities of a server, without implying a resource action.";
    default:
      return "";
  }
}

/**
 * Get the text equivalent of a HTTP status code.
 * (Thanks, Chat GPT 4.)
 */
export function getStatusText(status: number): string {
  switch (status) {
    case 100:
      return "Continue";
    case 101:
      return "Switching Protocols";
    case 102:
      return "Processing"; // WebDAV
    case 103:
      return "Early Hints";
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 202:
      return "Accepted";
    case 203:
      return "Non-Authoritative Information";
    case 204:
      return "No Content";
    case 205:
      return "Reset Content";
    case 206:
      return "Partial Content";
    case 207:
      return "Multi-Status"; // WebDAV
    case 208:
      return "Already Reported"; // WebDAV
    case 226:
      return "IM Used"; // HTTP Delta encoding
    case 300:
      return "Multiple Choices";
    case 301:
      return "Moved Permanently";
    case 302:
      return "Found";
    case 303:
      return "See Other";
    case 304:
      return "Not Modified";
    case 305:
      return "Use Proxy";
    case 307:
      return "Temporary Redirect";
    case 308:
      return "Permanent Redirect";
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 402:
      return "Payment Required";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 405:
      return "Method Not Allowed";
    case 406:
      return "Not Acceptable";
    case 407:
      return "Proxy Authentication Required";
    case 408:
      return "Request Timeout";
    case 409:
      return "Conflict";
    case 410:
      return "Gone";
    case 411:
      return "Length Required";
    case 412:
      return "Precondition Failed";
    case 413:
      return "Payload Too Large";
    case 414:
      return "URI Too Long";
    case 415:
      return "Unsupported Media Type";
    case 416:
      return "Range Not Satisfiable";
    case 417:
      return "Expectation Failed";
    case 418:
      return "I'm a teapot"; // April Fools' joke in RFC 2324
    case 421:
      return "Misdirected Request";
    case 422:
      return "Unprocessable Entity"; // WebDAV
    case 423:
      return "Locked"; // WebDAV
    case 424:
      return "Failed Dependency"; // WebDAV
    case 425:
      return "Too Early";
    case 426:
      return "Upgrade Required";
    case 428:
      return "Precondition Required";
    case 429:
      return "Too Many Requests";
    case 431:
      return "Request Header Fields Too Large";
    case 451:
      return "Unavailable For Legal Reasons";
    case 500:
      return "Internal Server Error";
    case 501:
      return "Not Implemented";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    case 504:
      return "Gateway Timeout";
    case 505:
      return "HTTP Version Not Supported";
    case 506:
      return "Variant Also Negotiates";
    case 507:
      return "Insufficient Storage"; // WebDAV
    case 508:
      return "Loop Detected"; // WebDAV
    case 510:
      return "Not Extended";
    case 511:
      return "Network Authentication Required";
    default:
      return "";
  }
}

/**
 * Get a brief explanation of a HTTP status code.
 * (Thanks, Chat GPT 4.)
 */
export function getStatusExplanation(status: number): string {
  switch (status) {
    case 100:
      return "The initial part of a request has been received and has not yet been rejected by the server.";
    case 101:
      return "The server understands and is willing to comply with the client's request, via the Upgrade message header field, for a change in the application protocol being used on this connection.";
    case 102:
      return "Processing (WebDAV); the server has received and is processing the request, but no response is available yet.";
    case 103:
      return "Early hints that the server is likely to send a final response with the header fields included in the informational response.";
    case 200:
      return "The request has succeeded.";
    case 201:
      return "The request has been fulfilled and has resulted in one or more new resources being created.";
    case 202:
      return "The request has been accepted for processing, but the processing has not been completed.";
    case 203:
      return "The request was successful but the enclosed payload has been modified from that of the origin server's 200 OK response by a transforming proxy.";
    case 204:
      return "The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.";
    case 205:
      return "The server has fulfilled the request and desires that the user agent reset the 'document view', which caused the request to be sent, to its original state as received from the origin server.";
    case 206:
      return "The server is delivering only part of the resource due to a range header sent by the client.";
    case 207:
      return "Provides status for multiple independent operations (WebDAV).";
    case 208:
      return "Used inside a DAV: propstat response element to avoid enumerating the internal members of multiple bindings to the same collection repeatedly.";
    case 226:
      return "The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.";
    case 300:
      return "The request has more than one possible response. The user-agent or user should choose one of them.";
    case 301:
      return "The URI of the requested resource has been changed permanently. The new URI is given in the response.";
    case 302:
      return "The URI of requested resource has been changed temporarily. New changes in the URI might be made in the future.";
    case 303:
      return "The server sent this response to direct the client to get the requested resource at another URI with a GET request.";
    case 304:
      return "This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.";
    case 305:
      return "Defined by a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.";
    case 307:
      return "The server is sending this response to direct the client to get the requested resource at another URI with same method that was used in the prior request.";
    case 308:
      return "This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header. This has the same semantics as the 301 Moved Permanently HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.";
    case 400:
      return "The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).";
    case 401:
      return "The request has not been applied because it lacks valid authentication credentials for the target resource.";
    case 402:
      return "The initial aim for creating this code was using it for digital payment systems, however this status code is used very rarely and no standard convention exists.";
    case 403:
      return "The server understood the request but refuses to authorize it.";
    case 404:
      return "The server can't find the requested resource. Links which lead to a 404 page are often called broken or dead links.";
    case 405:
      return "The request method is known by the server but has been disabled and cannot be used.";
    case 406:
      return "The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers, and the server is unwilling to supply a default representation.";
    case 407:
      return "Similar to 401 Unauthorized, but it indicates that the client needs to authenticate itself in order to use a proxy.";
    case 408:
      return "The server would like to shut down this unused connection. It is sent on an idle connection by some servers, even without any previous request by the client.";
    case 409:
      return "This response is sent when a request conflicts with the current state of the server.";
    case 410:
      return "This response is sent when the requested content has been permanently deleted from server, with no forwarding address.";
    case 411:
      return "The request did not specify the length of its content, which is required by the requested resource.";
    case 412:
      return "The server does not meet one of the preconditions that the requester put on the request header fields.";
    case 413:
      return "The request entity is larger than limits defined by server; the server might close the connection or return an Retry-After header field.";
    case 414:
      return "The URI requested by the client is longer than the server is willing to interpret.";
    case 415:
      return "The media format of the requested data is not supported by the server, so the server is rejecting the request.";
    case 416:
      return "The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.";
    case 417:
      return "This response code means the expectation indicated by the Expect request header field can't be met by the server.";
    case 418:
      return "The server refuses the attempt to brew coffee with a teapot.";
    case 421:
      return "The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.";
    case 422:
      return "The request was well-formed but was unable to be followed due to semantic errors.";
    case 423:
      return "The resource that is being accessed is locked.";
    case 424:
      return "The request failed due to failure of a previous request.";
    case 425:
      return "Indicates that the server is unwilling to risk processing a request that might be replayed.";
    case 426:
      return "The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.";
    case 428:
      return "The origin server requires the request to be conditional.";
    case 429:
      return 'The user has sent too many requests in a given amount of time ("rate limiting").';
    case 431:
      return "The server is unwilling to process the request because its header fields are too large. The request MAY be resubmitted after reducing the size of the request header fields.";
    case 451:
      return "The server is denying access to the resource as a consequence of a legal demand.";
    case 500:
      return "The server encountered an unexpected condition that prevented it from fulfilling the request.";
    case 501:
      return "The server does not support the functionality required to fulfill the request.";
    case 502:
      return "The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed in attempting to fulfill the request.";
    case 503:
      return "The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded.";
    case 504:
      return "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server or some other auxiliary server it needed to access in order to complete the request.";
    case 505:
      return "The server does not support, or refuses to support, the major version of HTTP that was used in the request message.";
    case 506:
      return "The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.";
    case 507:
      return "The server is unable to store the representation needed to complete the request.";
    case 508:
      return "The server detected an infinite loop while processing the request (sent in lieu of 208 Already Reported).";
    case 510:
      return "Further extensions to the request are required for the server to fulfill it.";
    case 511:
      return "The client needs to authenticate to gain network access.";
    default:
      return "Unknown status code";
  }
}
