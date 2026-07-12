import eagleIcon from '../assets/eagle-eye-icon.png'

export default function EagleEye({ enabled, onToggle }) {
  return (
    <button
      className={`eagle-eye-toggle ${enabled ? 'active' : ''}`}
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
    >
      <img className="eagle-eye-icon" src={eagleIcon} alt="" aria-hidden="true" />
      <span>
        <strong>Eagle Eye</strong>
        <small>{enabled ? 'Gold gist is on' : 'Show simple gist'}</small>
      </span>
    </button>
  )
}
