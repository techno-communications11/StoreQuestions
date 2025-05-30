import { Button } from 'react-bootstrap';
import { BsPerson, BsEye, BsCheckCircle, BsXCircle, BsCalendar } from 'react-icons/bs';
import { motion } from 'framer-motion';

const ImageTableRow = ({ image, index, handleOpenGallery, handleImageAccept, name, getStatusBadge }) => (

   
  <motion.tr
    className="text-center text-nowrap"
    key={index}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ scale: 1.01 }}
  >
    <td>{index + 1}</td>
    <td>{image.Question}</td>
    <td>{image.type === 'Daily Question' ? image.checklistType : image.type}</td>
    <td>
      <span className="d-flex justify-content-center align-items-center">
        <BsPerson className="me-2" />
        {image.ntid}
      </span>
    </td>
    <td>
      <Button
        variant="outline-pink"
        size="sm"
        onClick={() => handleOpenGallery(index)}
      >
        <BsEye className="me-2" />
        View Image
      </Button>
    </td>
    {image.image_verified ? (
      <td>{getStatusBadge(image.image_verified)}</td>
    ) : (
      <td>
        <span className="badge bg-info bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">Not Yet</span>
      </td>
    )}
    {image.verified_by ? (
      <td>
        <span className="badge bg-success bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">
          <BsPerson className="me-2" />
          {image.verified_by}
        </span>
      </td>
    ) : (
      <td>
        <span className="badge bg-info bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">Not Yet</span>
      </td>
    )}
    <td>
      <div className="d-flex gap-2 justify-content-center">
        {image.verified_by !== name ? (
          <>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleImageAccept(image.id, 'yes')}
            >
              <BsCheckCircle className="me-2" />
              Accept
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleImageAccept(image.id, 'no')}
            >
              <BsXCircle className="me-2" />
              Reject
            </Button>
          </>
        ) : (
          <span className="badge bg-success bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">
            <BsCheckCircle className="me-2" /> Done
          </span>
        )}
      </div>
    </td>
    <td>
      <span className="d-flex justify-content-center align-items-center text-muted">
        <BsCalendar className="me-2" />
        {new Date(image.createdat).toLocaleString()}
      </span>
    </td>
  </motion.tr>
);

export default ImageTableRow;