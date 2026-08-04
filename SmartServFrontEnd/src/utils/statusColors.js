export const getStatusBadge = (status) => {
  if (!status) return 'secondary';
  switch (status.toUpperCase()) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'COMPLETED': return 'primary';
    case 'REJECTED': return 'danger';
    case 'CANCELLED': return 'secondary';
    case 'BILLED': return 'dark';
    default: return 'primary';
  }
};
