import { Link } from "react-router";

export default function Test() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page to verify file resolution during the build process.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}