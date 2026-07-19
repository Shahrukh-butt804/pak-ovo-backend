const allowedOrigins = new Set([
  "customdev.solutions",
  "code-verse-dev.github.io",
  "pakovo",
  "localhost",
]);

const headers = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "VERSION",
];

const { NODE_ENV } = process.env;

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) =>
    !origin ||
      [...allowedOrigins].some((domain) => origin.includes(domain)) ||
      NODE_ENV === "development"
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS")),
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: headers,
  exposedHeaders: headers,
};

export default corsOptions;
