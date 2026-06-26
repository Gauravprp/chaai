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
-- Users can see their own calls
CREATE POLICY "Users can view their own calls" ON public.call_history
FOR SELECT USING (
    caller_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR receiver_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can insert calls where they are the caller
CREATE POLICY "Users can insert calls" ON public.call_history
FOR INSERT WITH CHECK (
    caller_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can update calls if they are part of it
CREATE POLICY "Users can update their calls" ON public.call_history
FOR UPDATE USING (
    caller_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR receiver_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- RLS Policies for call_signals
-- Users can see signals directed to them or sent by them
CREATE POLICY "Users can view their signals" ON public.call_signals
FOR SELECT USING (
    sender_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR receiver_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can insert signals if they are the sender
CREATE POLICY "Users can insert signals" ON public.call_signals
FOR INSERT WITH CHECK (
    sender_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Turn on Realtime for these tables
alter publication supabase_realtime add table call_history;
alter publication supabase_realtime add table call_signals;
