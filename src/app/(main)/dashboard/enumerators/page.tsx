import React from 'react';
import { EnumeratorsList } from '../../_components/enumerators-list';

const EnumeratorsPage: React.FC = () => {
    return (
        <div className="container">
            <h1>Enumerators Dashboard</h1>
            <p>Welcome to the Enumerators Dashboard. Here you can manage and view all enumerators.</p>
            <EnumeratorsList/>
        </div>
    );
};

export default EnumeratorsPage;