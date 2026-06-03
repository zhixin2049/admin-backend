import React from 'react';
import { Card, Avatar } from 'antd';

interface Major {
  id: number;
  name: string;
  description: string;
  iconBg: string;
  iconText: string;
  slug?: string;
}

interface MajorCardProps {
  major: Major;
  onClick?: () => void;
}

const MajorCard: React.FC<MajorCardProps> = ({ major, onClick }) => {
  return (
    <Card
      hoverable
      size="small"
      onClick={onClick}
      styles={{
        body: {
          padding: '0.75rem',
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
        },
      }}
    >
      <Card.Meta
        avatar={
          <Avatar
            shape="square"
            size={36}
            style={{ background: major.iconBg, fontWeight: 'bold', color: '#333' }}
          >
            {major.iconText}
          </Avatar>
        }
        title={major.name}
        description={major.description}
        style={{ alignItems: 'center' }}
      />
    </Card>
  );
};

export default MajorCard;
