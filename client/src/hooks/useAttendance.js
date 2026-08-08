import { useState, useCallback } from 'react';
import { attendanceAPI } from '../api/api';

const useAttendance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyAttendance = useCallback(async (range = 'month') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await attendanceAPI.getMyAttendance(range);
      setRecords(data.records);
      setStats(data.stats);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch attendance.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitEOD = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await attendanceAPI.submitEOD();
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit EOD report.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamAttendance = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await attendanceAPI.getTeamAttendance(date);
      setTeamData(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch team attendance.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    records, stats, teamData, loading, error,
    fetchMyAttendance, submitEOD, fetchTeamAttendance,
  };
};

export default useAttendance;
