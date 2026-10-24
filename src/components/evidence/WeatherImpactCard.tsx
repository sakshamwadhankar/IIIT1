import Icon from '../shared/Icon';
import { WEATHER_FIXTURES } from '../../data/weather';
import { INCIDENT_TREND_FIXTURE } from '../../data/incident-trend';

/** Weather + rain evidence card: window, probability, covered distance. */
export function WeatherImpactCard({ route }: { route: { comfort: { coveredWalkingMeters: number }; weatherImpact: string; walkingMeters: number } }) {
  const rain = WEATHER_FIXTURES[0];
  return (
    <div className="weather-card" aria-label="Rain evidence">
      <div className="weather-card__head">
        <Icon name="rain" size={20} />
        <h4>Rain evidence</h4>
        <span className="weather-card__probability">{rain.probabilityPercent}% chance</span>
      </div>
      <p className="weather-card__window">
        Light rain likely between {rain.rainWindow} — about 40 minutes after the demo clock.
      </p>
      <p className="weather-card__coverage">
        Selected route keeps <strong>{route.comfort.coveredWalkingMeters} m</strong> of the{' '}
        {route.walkingMeters} m walk under cover. Carried rain exposure on this route:{' '}
        <strong>{route.weatherImpact}</strong>.
      </p>
      <p className="weather-card__meta">
        Source: {rain.sourceLabel} · {rain.issuedAt} · Medium confidence · Demo forecast
      </p>
    </div>
  );
}

/** Incident-trend card with a sparkline, period, and scope note. */
export function IncidentTrendCard() {
  const trend = INCIDENT_TREND_FIXTURE;
  const max = Math.max(...trend.weeklyCounts, trend.baselineCount);
  const width = 180;
  const height = 44;
  const step = width / (trend.weeklyCounts.length - 1);
  const points = trend.weeklyCounts
    .map((count, index) => `${index * step},${height - (count / max) * (height - 6) - 3}`)
    .join(' ');
  const baselineY = height - (trend.baselineCount / max) * (height - 6) - 3;

  return (
    <div className="trend-card" aria-label="Incident trend for the demo corridor">
      <div className="trend-card__head">
        <Icon name="shield" size={20} />
        <h4>Incident trend — {trend.period}</h4>
      </div>
      <p>{trend.summary}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="trend-card__spark"
        role="img"
        aria-label={`Weekly reported incidents over six weeks: ${trend.weeklyCounts.join(', ')}, against a baseline of ${trend.baselineCount}.`}
      >
        <line x1="0" y1={baselineY} x2={width} y2={baselineY} stroke="#b6bcd0" strokeDasharray="4 3" strokeWidth="1.5" />
        <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="trend-card__note">{trend.scopeNote}</p>
      <p className="trend-card__meta">
        Source: {trend.sourceLabel} · Period: {trend.period} · Limited evidence · Demo area only
      </p>
    </div>
  );
}
