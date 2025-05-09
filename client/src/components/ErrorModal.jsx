import { useDispatch, useSelector } from 'react-redux';

import { dismissError } from '../store/actions/error.actions';

const ErrorModal = () => {
	const error = useSelector(state => state.error.error);
	const showError = useSelector(state => state.error.showError);

	const dispatch = useDispatch();

	const dismissModalHandler = () => {
		dispatch(dismissError());
	};

	return (
		(error && showError) && (
            <h3 className='error-modal' onClick={dismissModalHandler}>El Error fue: {error}</h3>
		)
	);
};

export default ErrorModal;