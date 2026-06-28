export default function Search({ query, onQueryChange }) {
  return (
    <label className="search-wrap">
      <span>Search study guide</span>
      <input
        className="search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Try Band 14, eSIM, priority, hotspot..."
      />
    </label>
  );
}
