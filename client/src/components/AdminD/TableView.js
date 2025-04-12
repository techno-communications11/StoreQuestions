import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { BsArrowRightCircle, BsShop, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

const TableView = ({ filteredData, handleStoreSelection }) => (
  <div className="d-none d-lg-block">
    <Card className="shadow">
      <Card.Body>
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              {['SINO', 'Market', 'Store Name', 'Completed', 'Not Completed'].map(header => (
                <th
                  key={header}
                  className="text-center"
                  style={{ backgroundColor: '#E10174', color: 'white' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((store, index) => (
              <tr
                key={store.storename}
                onClick={() => handleStoreSelection(store.storename)}
                className="cursor-pointer text-center"
              >
                <td className="fw-bold text-success">{index + 1}</td>
                <td className="text-pink fw-bold">
                  <BsArrowRightCircle className="me-2" />
                  {store.market}
                </td>
                <td className="text-primary fw-bold">
                  <BsShop className="me-2" />
                  {store.storename}
                </td>
                <td className="text-center text-success">
                  <BsCheckCircleFill className="me-2" />
                  {store.completed_count}
                </td>
                <td className="text-center text-danger">
                  <BsXCircleFill className="me-2" />
                  {store.not_completed_count}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </div>
);

export default TableView;