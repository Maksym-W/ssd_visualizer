import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default function MyTooltip({ id, children, title }) {
  return (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      {children}
    </OverlayTrigger>
  )
}
