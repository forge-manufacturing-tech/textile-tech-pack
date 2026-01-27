import React from 'react';
import { BlobResponse, SessionResponse, ProjectResponse } from '../api/generated';

export interface PluginContext {
    project: ProjectResponse | null;
    session: SessionResponse | null;
    blobs: BlobResponse[];
}

export interface Plugin {
    id: string;
    name: string;
    description: string;
    icon?: React.ReactNode;
    Component: React.ComponentType<{ context: PluginContext; onClose: () => void }>;
}
