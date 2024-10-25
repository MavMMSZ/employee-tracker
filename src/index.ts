import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connections';