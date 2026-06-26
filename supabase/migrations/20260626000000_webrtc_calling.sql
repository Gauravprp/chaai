-- Create call_history table
CREATE TABLE public.call_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caller_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ongoing', 'completed', 'missed', 'rejected', 'busy', 'failed')),
    type TEXT NOT NULL CHECK (type IN ('audio', 'video')),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create call_signals table
CREATE TABLE public.call_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID NOT NULL REFERENCES public.call_history(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offer', 'answer', 'ice_candidate', 'end', 'reject', 'accept', 'busy')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on RLS
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_history
CREATE POLICY "Allow all actions on call_history" ON public.call_history
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for call_signals
CREATE POLICY "Allow all actions on call_signals" ON public.call_signals
  FOR ALL USING (true) WITH CHECK (true);


-- Turn on Realtime for these tables
alter publication supabase_realtime add table call_history;
alter publication supabase_realtime add table call_signals;
