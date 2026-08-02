import React from 'react';
import { Card, Table, Row, Col } from 'react-bootstrap';

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="p-0">
      <Table responsive className="mb-0">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-3 px-4">
                  <div className="placeholder-glow">
                    <span className={`placeholder col-${(c % 3) + 7}`}></span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export const CardSkeleton = ({ count = 3 }) => (
  <Row className="g-4">
    {Array.from({ length: count }).map((_, i) => (
      <Col key={i} xs={12} md={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body className="p-4 placeholder-glow">
            <div className="d-flex align-items-center mb-3">
              <span className="placeholder col-3 py-4 rounded me-3"></span>
              <div className="w-100">
                <span className="placeholder col-5 mb-2"></span>
                <span className="placeholder col-8"></span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);
