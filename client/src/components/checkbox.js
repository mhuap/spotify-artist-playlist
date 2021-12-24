import { BsCheckLg} from 'react-icons/bs';

function Checkbox({checked}) {
  return <div className="checkbox">
    {checked ? <BsCheckLg /> : null}
  </div>
}

export default Checkbox;
