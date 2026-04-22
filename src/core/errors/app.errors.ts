import { GraphQLError } from "graphql";

export class UnpaidBillError extends GraphQLError {
  constructor() {
    super("Action blocked: Patient has outstanding unpaid invoices.", {
      extensions: { code: "PAYMENT_REQUIRED", http: { status: 402 } },
    });
  }
}

export class ConflictError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: "CONFLICT", http: { status: 409 } },
    });
  }
}

export class AuthenticationError extends GraphQLError {
  constructor() {
    super("You must be logged in to access this resource.", {
      extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
    });
  }
}

// 403 Errors (Fixed syntax and made the message dynamic with a default value!)
export class ForbiddenError extends GraphQLError {
  constructor(
    message: string = "You do not have permission to perform this action.",
  ) {
    super(message, {
      extensions: { code: "FORBIDDEN", http: { status: 403 } },
    });
  }
}

// 404 Errors
export class NotFoundError extends GraphQLError {
  constructor(entity: string, id?: string | number) {
    const message = id
      ? `${entity} with ID ${id} not found.`
      : `${entity} not found.`;
    super(message, {
      extensions: { code: "NOT_FOUND", http: { status: 404 } },
    });
  }
}

// 400 Errors (Business Logic / Validation)
export class BadRequestError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });
  }
}

// 401 Errors (Auth)
export class InvalidCredentialsError extends GraphQLError {
  constructor() {
    super("Invalid email or password", {
      extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
    });
  }
}
